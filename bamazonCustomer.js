var inquirer = require("inquirer");

var Table = require("cli-table");

var mysql = require("mysql");

var sep = "\n-----------------------------------------------\n";

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazonDB"
});

function printProducts(buying) {
    var table = new Table({
        head: ['Item Id', 'Product Name', 'Price','Quantity']
      , colWidths: [10,30,10,10]
    });
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) {
            console.log(err);
        } else {
            for (i = 0; i < res.length; i++) {
                // console.log(
                //     sep +
                //     "item id: " +
                //     res[i].item_id +
                //     "\nProduct Name: " +
                //     res[i].product_name +
                //     "\nPrice: " +
                //     res[i].price +
                //     "\nQuantity Left: " +
                //     res[i].stock_quantity
                // );
                table.push(
                    [res[i].item_id, res[i].product_name,res[i].price,res[i].stock_quantity]
                 
                );
            }
            console.log(table.toString());
            if (buying) {
                buy();
            }
        }
    })
};

    function update(userHowMany, quantity, difference, itemID) {
        // console.log(`you want: ${userHowMany} quantity: ${quantity} left: ${difference} id: ${itemID}`);
        connection.query(`UPDATE products SET stock_quantity = ? WHERE item_id = ?;`, [difference, itemID], function (err, res) {
            if (err) {
                console.log(`Your error is: ${err}`);
            } else {
                console.log(sep + "Thank you for your purchase! Please allow 2 day for delivery for PRIMARY members." + sep)

                start();
            }
        });

    };

    function buy() {
        // printProducts();
        console.log(sep);
        inquirer.prompt([{
            type: "input",
            name: "itemId",
            message: "Please enter the item_id number...",
        }, {
            type: "input",
            name: "howMany",
            message: "How many units would you like to purchase?",
        }]).then(function (user) {
            connection.query("SELECT * FROM products WHERE item_id=?", [user.itemId], function (err, res) {
                var quantity = res[0].stock_quantity;
                var difference = quantity - user.howMany;
                var userHowMany = user.howMany;
                var itemID = user.itemId;
                if (err) {
                    console.log(err);
                } else if (user.howMany <= quantity && quantity > 0) {
                    update(userHowMany, quantity, difference, itemID);
                } else if (quantity===0){
                    console.log(`${sep}Sorry, this item is currently out of stock.`);
                    start();
                } else {
                    console.log(`${sep}We currently only have ${quantity} in stock`);
                    buy();
                }

            });

        });



    };

    function start() {
        console.log(sep);
        inquirer.prompt([
            {
                type: "list",
                name: "buyOrNot",
                message: "What would you like to do today?",
                choices: ["Buy an item", "EXIT"]
            }
        ])
            .then(function (user) {
                if (user.buyOrNot === "EXIT") {
                    console.log(sep + "Thank you for choosing Bamazon! See you next time..." + sep);
                    connection.end();

                } else {
                    // console.log(sep);
                    // buy();
                    printProducts(true);
                }
            });
    };


    function managerInput() {
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "productName",
                    message: "Item Name?"
                },
                {
                    type: "input",
                    name: "department",
                    message: "Department?"
                },
                {
                    type: "input",
                    name: "price",
                    message: "How much?"
                }, {
                    type: "input",
                    name: "quantity",
                    message: "Quantity?"
                }
            ])
            .then(function (user) {
                console.log(user);
                inquirer
                    .prompt([
                        {
                            type: "confirm",
                            name: "sure",
                            message: "Are you sure this is what you want to post?"
                        }
                    ])
                    .then(function (yorN) {
                        if (yorN == false) {
                            post();
                        } else {
                            connection.query(
                                `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUE (?,?,?,?)`, [user.productName, user.department, user.price, user.quantity],
                                function (err, res) {
                                    if (err) {
                                        console.log("error: " + err);
                                    } else {
                                        console.log(
                                            `Your item ${user.productName} has been posted for ${
                                            user.price
                                            }!${sep}`
                                        );
                                        inquirer.prompt([{
                                            type: "list",
                                            name: "choice",
                                            message: "More or Exit",
                                            choices: ["Add More", "EXIT"]
                                        }]).then(function (user) {
                                            if (user.choice === "EXIT") {
                                                connection.end();
                                            } else {
                                                managerInput();
                                            }
                                        })
                                    }
                                }
                            );
                        }
                    });
            });
    }
    // !!!!!!!switch these for manager input or start for user input
    // managerInput();
    start();

