from math import ceil

def paginate_query(query, page, per_page):
    """
    Paginate a SQLAlchemy query.
    Returns a named tuple with:
    - items: current page items
    - total: total items count
    - pages: total pages count
    """
    items = query.limit(per_page).offset((page - 1) * per_page).all()
    total = query.order_by(None).count()  # More efficient count without ordering
    pages = ceil(total / per_page) if per_page else 1
    
    from collections import namedtuple
    Pagination = namedtuple('Pagination', ['items', 'total', 'pages'])
    return Pagination(items=items, total=total, pages=pages)