import secrets
import string

def generate_secret_key(length=32):
    # Define the characters to use for the secret key
    characters = string.ascii_letters + string.digits + string.punctuation

    # Generate a secure secret key
    secret_key = ''.join(secrets.choice(characters) for _ in range(length))
    
    return secret_key

if __name__ == "__main__":
    # Generate a 32-character secret key (you can change the length if needed)
    secret_key = generate_secret_key(32)
    print("Generated Secret Key:", secret_key)