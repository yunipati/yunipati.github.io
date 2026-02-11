#!/usr/bin/env python3
"""簡単な計算ツール"""

def add(a, b):
    """足算"""
    return a + b

def subtract(a, b):
    """引算"""
    return a - b

def multiply(a, b):
    """掛算"""
    return a * b

def divide(a, b):
    """割算"""
    if b == 0:
        return "エラー: 0で割ることはできません"
    return a / b

def main():
    print("=== 簡単な計算ツール ===")
    print("操作:")
    print("1: 足算")
    print("2: 引算")
    print("3: 掛算")
    print("4: 割算")
    print("5: 終了")
    print()

    while True:
        choice = input("操作を選んでください (1/2/3/4/5): ").strip()

        if choice == "5":
            print("計算ツールを終了します。")
            break

        if choice not in ["1", "2", "3", "4"]:
            print("無効な選択です。もう一度試してください。\n")
            continue

        try:
            num1 = float(input("最初の数字を入力してください: "))
            num2 = float(input("次の数字を入力してください: "))
        except ValueError:
            print("無効な入力です。数字を入力してください。\n")
            continue

        if choice == "1":
            result = add(num1, num2)
            print(f"結果: {num1} + {num2} = {result}\n")
        elif choice == "2":
            result = subtract(num1, num2)
            print(f"結果: {num1} - {num2} = {result}\n")
        elif choice == "3":
            result = multiply(num1, num2)
            print(f"結果: {num1} × {num2} = {result}\n")
        elif choice == "4":
            result = divide(num1, num2)
            print(f"結果: {num1} ÷ {num2} = {result}\n")

if __name__ == "__main__":
    main()
