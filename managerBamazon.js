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

//Starts the Questions
function start() {
    console.log(sep);
    inquirer.prompt([
        {
            type: "list",
            name: "mgr",
            message: "What would you like to do today?",
            choices: ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product", "EXIT"]
        }
    ])
        .then(function (user) {
            switch(user.mgr) {
                case "View Products for Sale":
                  printProducts(true);
                  break;

                  case "View Low Inventory":
                  start();
                  break;

                  case "Add to Inventory":
                  printProducts(false,true);
                //   addInventory();
                  break;

                  case "Add New Product":
                  addNewProduct();
                  break;

                default:
                //ends software
                  console.log(sep+"Keep up the good work!!!")
                  connection.end();
              }
        });
};

function addInventory() {
    
    inquirer
        .prompt([
            {
                type: "input",
                name: "itemId",
                message: "Item ID number?"
            },
            {
                type: "input",
                name: "addingAmount",
                message: "How many NEW units would you like to ADD?"
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
                            `UPDATE products SET stock_quantity= ? WHERE item_id= ?;`,[user.addingAmount, user.itemId],
                            function (err, res) {
                                if (err) {
                                    console.log("error: " + err);
                                } else {
                                    console.log(
                                        `Your item ${user.productName} has been updated to ${
                                        user.addingAmount
                                        } units.${sep}`
                                    );
                                    inquirer.prompt([{
                                        type: "list",
                                        name: "choice",
                                        message: "More or Exit",
                                        choices: ["Add More","Other", "EXIT"]
                                    }]).then(function (user) {
                                        if (user.choice === "EXIT") {
                                            connection.end();
                                        } else if (user.choice === "Add More") {
                                            addNewProduct();
                                        } else {
                                            start();
                                        }
                                    })
                                }
                            }
                        );
                    }
                });
        });
}





// Shows all products
function printProducts(check,addInv) {
    var table = new Table({
        head: ['Item Id', 'Product Name', 'Price','Quantity'],
        colWidths: [10,30,10,10]
    });
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) {
            console.log(err);
        } else {
            for (i = 0; i < res.length; i++) {
                
                table.push(
                    [res[i].item_id, res[i].product_name,res[i].price,res[i].stock_quantity]
                 
                );
            }
            console.log(table.toString());
            if (check) {
            start();
            }
            if (addInv) {
                addInventory();
            }
        }
    })
};


 function addNewProduct() {
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
                                        choices: ["Add More","Other", "EXIT"]
                                    }]).then(function (user) {
                                        if (user.choice === "EXIT") {
                                            connection.end();
                                        } else if (user.choice === "Add More") {
                                            addNewProduct();
                                        } else {
                                            start();
                                        }
                                    })
                                }
                            }
                        );
                    }
                });
        });
}

start();