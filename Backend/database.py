import mysql.connector


def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Shaurya26112006",
        database="burger_x"
    )

    return connection