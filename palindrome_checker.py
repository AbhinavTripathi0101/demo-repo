def is_palindrome(number):
    # Convert the number to a string to easily reverse it
    num_str = str(number)
    # Compare the string with its reverse
    return num_str == num_str[::-1]

if __name__ == "__main__":
    try:
        user_input = int(input("Enter an integer: "))
        if is_palindrome(user_input):
            print(f"{user_input} is a palindrome number.")
        else:
            print(f"{user_input} is not a palindrome number.")
    except ValueError:
        print("Invalid input. Please enter an integer.")
