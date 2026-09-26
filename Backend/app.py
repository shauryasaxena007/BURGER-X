from flask import Flask, jsonify, request, send_from_directory
from database import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORS(app)

@app.route("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(BASE_DIR, "script.js")

@app.route("/<path:filename>")
def serve_files(filename):
    return send_from_directory(BASE_DIR, filename)

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "sindex.html")


@app.route("/auth")
def auth():
    return send_from_directory(BASE_DIR, "auth.html")


@app.route("/burgers")
def get_burgers():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM burgers")

    burgers = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(burgers)

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Check if email already exists
    cursor.execute(
        "SELECT id FROM users WHERE email = %s",
        (email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        connection.close()

        return jsonify({
            "success": False,
            "message": "Email already registered"
        }), 409

    # Insert new user
    cursor.execute(
        """
        INSERT INTO users (name, email, password)
        VALUES (%s, %s, %s)
        """,
        (name, email, generate_password_hash(password))
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Registration successful"
    }), 201

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (email,)
    )

    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    if not check_password_hash(user["password"], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200

@app.route("/cart", methods=["POST"])
def add_to_cart():

    data = request.get_json()

    user_id = data.get("user_id")
    burger_id = data.get("burger_id")
    quantity = data.get("quantity", 1)

    if not user_id or not burger_id:
        return jsonify({
            "success": False,
            "message": "User ID and Burger ID are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        # Check if item already exists in cart
        cursor.execute("""
            SELECT * FROM cart
            WHERE user_id = %s AND burger_id = %s
        """, (user_id, burger_id))

        existing_item = cursor.fetchone()

        if existing_item:

            # Increase quantity
            new_quantity = existing_item["quantity"] + quantity

            cursor.execute("""
                UPDATE cart
                SET quantity = %s
                WHERE user_id = %s AND burger_id = %s
            """, (new_quantity, user_id, burger_id))

        else:

            # Add new item
            cursor.execute("""
                INSERT INTO cart (user_id, burger_id, quantity)
                VALUES (%s, %s, %s)
            """, (user_id, burger_id, quantity))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Item added to cart"
        }), 200

    except Exception as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()

@app.route("/cart/<int:user_id>", methods=["GET"])
def get_cart(user_id):

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                cart.id,
                cart.burger_id,
                burgers.name,
                burgers.price,
                burgers.image,
                cart.quantity
            FROM cart
            JOIN burgers ON cart.burger_id = burgers.id
            WHERE cart.user_id = %s
        """, (user_id,))

        cart_items = cursor.fetchall()

        return jsonify({
            "success": True,
            "cart": cart_items
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()
        
if __name__ == "__main__":
    app.run(debug=True)