import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCurrentlyEditing,
  closeProductEditor,
  setCurrentlyEditing,
} from "../store/slices/productSlice";
import { RootState } from "../store";
import { categoryDropdownItems } from "../utils/mock_data";
import {
  useAddCategoryMutation,
  useAddProductMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateProductMutation,
} from "../store/slices/apiSlice";
import { Actions, ProductCategory } from "../utils/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { CheckIcon, Plus, Trash } from "lucide-react";
import clsx from "clsx";

function NewProductSideBar() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState("");

  const productSelector = useSelector((state: RootState) => state.products);

  const {
    isLoading: categoryIsLoading,
    error: categoryErr,
    data: categoryData,
  } = useGetCategoriesQuery();

  // console.log("categories: ", categoryIsLoading, categoryData, categoryErr);

  const dropdown = useSelector(
    (state: RootState) =>
      state.dropdown.dropdowns["add_product_sidbar_category"]
  );

  const [addProduct] = useAddProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [addCategory] = useAddCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const createCategory = async () => {
    setIsLoading(true);
    try {
      toast("Creating category...");
      const response = await addCategory({
        name: newCategoryValue,
        description: "",
      });
      console.log("response: ", response);
      setIsLoading(false);

      if (response.error) {
        //@ts-ignore
        if (response.error.status == 409) {
          toast.error("Category already exists.");
          return;
        }
        toast.error("Couldn't create category at the moment.");
        setShowNewCategoryInput(false);
        setNewCategoryValue("");
        return;
      }
      dispatch(
        setCurrentlyEditing({
          category: String(response.data?.category.id),
        })
      );

      toast.success("Category created successfuly");
      setShowNewCategoryInput(false);
      setNewCategoryValue("");
    } catch (error) {
      setIsLoading(false);
      toast.error("Couldn't create category at the moment.");
      setShowNewCategoryInput(false);
      setNewCategoryValue("");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (
      productSelector.action_type == Actions.CREATE &&
      productSelector.currentlyEditing
    ) {
      try {
        toast("Adding product...");
        console.log("product: ", productSelector.currentlyEditing);
        const response = await addProduct({
          ...productSelector.currentlyEditing,
          category_id: Number(productSelector.currentlyEditing.category),
          bottle_size: 0,
        });

        if (response.error) {
          setIsLoading(false);
          toast.error("Couldn't add product at the moment.");
          return;
        }

        dispatch(clearCurrentlyEditing());
        dispatch(closeProductEditor());
        setIsLoading(false);
        toast.success("Product added successfuly");
      } catch {
        setIsLoading(false);
        toast.error("Couldn't add product at the moment.");
      }
    } else if (
      productSelector.action_type == Actions.UPDATE &&
      productSelector.currentlyEditing
    ) {
      try {
        toast("Updating product...");
        const response = await updateProduct({
          ...productSelector.currentlyEditing,
          category_id: Number(productSelector.currentlyEditing.category),
          in_stock: productSelector.currentlyEditing.in_stock,
          product_id: productSelector.currentlyEditing.id,
        });

        if (response.error) {
          setIsLoading(false);
          toast.error("Couldn't update product at the moment.");
          return;
        }

        dispatch(clearCurrentlyEditing());
        dispatch(closeProductEditor());
        setIsLoading(false);
        toast.success("Product updated successfuly");
      } catch {
        setIsLoading(false);
        toast.error("Couldn't updatew product at the moment.");
      }
    }
  };

  return (
    <div className="fixed w-[100vw] h-[100vh] bg-black/45 top-0 right-0 z-20 overflow-y-auto">
      <div className="h-full w-[25rem] bg-wBrand-background fixed top-0 right-0 p-6 space-y-8">
        <h1 className="text-2xl font-semibold mt-8">
          {productSelector.action_type?.toString()} product
        </h1>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              PRODUCT NAME
            </p>
            <div className="text-sm">
              <input
                type="text"
                value={productSelector?.currentlyEditing?.name}
                onChange={(e) =>
                  dispatch(setCurrentlyEditing({ name: e.target.value }))
                }
                placeholder="Enter product name"
                className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
              />
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              PRODUCT CATEGORY
            </p>
            <div className="flex gap-4">
              <Select
                value={productSelector.currentlyEditing?.category}
                onValueChange={(value) => {
                  dispatch(
                    setCurrentlyEditing({
                      category: value,
                    })
                  );
                }}
              >
                <SelectTrigger className="w-full rounded-xl h-max p-3">
                  <SelectValue
                    placeholder={
                      productSelector.currentlyEditing?.category ??
                      "Select product category"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-wBrand-background mt-2 rounded-xl">
                  {categoryData &&
                    ((categoryData as unknown) as Array<{
                      name: string;
                      id: number;
                    }>).map((item, idx) => (
                      <div className="flex justify-between">
                        <SelectItem
                          className="p-3 flex items-center"
                          key={idx}
                          value={String(item.id)}
                        >
                          <p>{item.name}</p>
                        </SelectItem>
                        <button
                          onClick={() => {
                            try {
                              toast.info("Deleting category...");
                              deleteCategory({ category_id: item.id });
                              toast.success("Category deleted successfuly");
                            } catch (e) {
                              toast.error(
                                "Couldn't delete category at this time."
                              );
                              console.log("error: ", e);
                            }
                          }}
                          className="pr-3"
                        >
                          <Trash className="size-4" />
                        </button>
                      </div>
                    ))}
                </SelectContent>
              </Select>
              {showNewCategoryInput ? (
                <button
                  onClick={() => createCategory()}
                  disabled={newCategoryValue.trim() == ""}
                  className={clsx(
                    "h-11 px-4 rounded-xl border flex items-center justify-center",
                    newCategoryValue.trim() == ""
                      ? "text-wBrand-accent/20 border-wBrand-accent/20"
                      : "text-wBrand-accent border-wBrand-accent"
                  )}
                >
                  <CheckIcon className="h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowNewCategoryInput(true)}
                  className={clsx(
                    "h-11 text-wBrand-accent px-4 rounded-xl border flex items-center justify-center border-wBrand-accent"
                  )}
                >
                  <Plus className="h-4" />
                </button>
              )}
            </div>
            {showNewCategoryInput && (
              <div
                onClick={(e) => setShowNewCategoryInput(false)}
                className="fixed top-0 right-0 justify-center flex w-[100vw] h-full z-40 bg-black/60"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-[25rem] rounded-lg bg-wBrand-background h-max relative top-[30%] p-8 space-y-8"
                >
                  <h3 className="text-2xl text-wBrand-accent">
                    Create new product category
                  </h3>
                  <input
                    type="text"
                    value={newCategoryValue}
                    onChange={(e) => setNewCategoryValue(e.target.value)}
                    className="outline-none text-sm rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
                    placeholder="Enter new category name"
                  />
                  <div className="flex w-full justify-end">
                    <button
                      onClick={() => createCategory()}
                      disabled={newCategoryValue.trim() == ""}
                      className={clsx(
                        "h-11 px-4 rounded-xl border flex items-center justify-center",
                        newCategoryValue.trim() == ""
                          ? "text-wBrand-accent/20 border-wBrand-accent/20"
                          : "text-wBrand-accent border-wBrand-accent"
                      )}
                    >
                      <CheckIcon className="h-4" />
                      <p>Create</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* <div className="flex space-x-4">
            <div className="space-y-4">
              <p className="text-xs text-wBrand-foreground/60 font-medium">
                PRODUCT ABV %
              </p>
              <div className="text-sm">
                <input
                  type="number"
                  value={productSelector?.currentlyEditing?.abv}
                  onChange={(e) =>
                    dispatch(
                      setCurrentlyEditing({
                        abv: (e.target.value as unknown) as number,
                      })
                    )
                  }
                  placeholder="Enter product abv %"
                  className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
                />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-wBrand-foreground/60 font-medium">
                BOTTLE SIZE
              </p>
              <div className="text-sm">
                <input
                  type="number"
                  value={productSelector?.currentlyEditing?.bottle_size}
                  onChange={(e) =>
                    dispatch(
                      setCurrentlyEditing({
                        bottle_size: (e.target.value as unknown) as number,
                      })
                    )
                  }
                  placeholder="Enter bottle size"
                  className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
                />
              </div>
            </div>
          </div> */}
          <div className="flex space-x-4">
            <div className="space-y-4 flex-1">
              <p className="text-xs text-wBrand-foreground/60 font-medium">
                PRODUCT PRICE
              </p>
              <div className="text-sm">
                <input
                  value={productSelector?.currentlyEditing?.price}
                  onChange={(e) =>
                    dispatch(
                      setCurrentlyEditing({
                        price: (e.target.value as unknown) as number,
                      })
                    )
                  }
                  type="number"
                  placeholder="Enter product price"
                  className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
                />
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <p className="text-xs text-wBrand-foreground/60 font-medium">
                NO IN STOCK
              </p>
              <div className="text-sm">
                <input
                  value={productSelector?.currentlyEditing?.in_stock}
                  onChange={(e) =>
                    dispatch(
                      setCurrentlyEditing({
                        in_stock: (e.target.value as unknown) as number,
                      })
                    )
                  }
                  type="number"
                  placeholder="Enter no. of product available"
                  className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex gap-4 justify-end">
          <button
            onClick={() => dispatch(closeProductEditor())}
            className="py-2 px-5 text-sm border duration-700 border-wBrand-accent/30 hover:border-wBrand-accent font-semibold rounded-lg text-wBrand-accent/30 hover:text-wBrand-accent"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="py-2 px-5 text-sm bg-wBrand-accent font-semibold rounded-lg text-wBrand-background"
          >
            {productSelector.action_type?.toString()} product
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewProductSideBar;
