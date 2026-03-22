echo "root" | docker secret create mysql_rootpw -
echo "mydb" | docker secret create mysql_db -
echo "user" | docker secret create mysql_user -
echo "password" | docker secret create mysql_password -