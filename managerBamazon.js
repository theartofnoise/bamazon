var inquirer = require("inquirer");

var Table = require("cli-table");
const CFonts = require('cfonts');

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
                  viewLowInv();
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

//Gets all inv with 5 or less
function viewLowInv() {
    var table = new Table({
        head: ['Item Id', 'Product Name', 'Price','Quantity'],
        colWidths: [10,30,10,10]
    });
    connection.query(`SELECT * FROM products WHERE stock_quantity <= 5;`, function (err, res) {
        if (err) {
            console.log(err);
        } else {
            for (i = 0; i < res.length; i++) {
                
                table.push(
                    [res[i].item_id, res[i].product_name,res[i].price,res[i].stock_quantity]
                 
                );
            }
            console.log(table.toString());
            inquirer.prompt([{
                type: "list",
                name: "choice",
                message: "What's Next",
                choices: ["Main Menu", "EXIT"]
            }]).then(function (user2) {
                if (user2.choice === "EXIT") {
                    connection.end();
                } else if (user2.choice === "Main Menu") {
                    start();
                }
            });
        }

});
};

//Adds quantity to stock
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
                        //updates the quantity by adding!!!
                        connection.query(
                            `UPDATE products SET stock_quantity=stock_quantity + ? WHERE item_id= ?;`,[user.addingAmount, user.itemId],
                            function (err, res) {
                                if (err) {
                                    console.log("error: " + err);
                                } else {
                                    connection.query(`SELECT * FROM products WHERE item_id= ?;`,[user.itemId], function (err, res) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                    console.log(
                                        `Your item ${res[0].item_id} has added ${
                                        user.addingAmount
                                        } units. Item ${res[0].product_name} now has ${res[0].stock_quantity} total units. ${sep}`);
                                        inquirer.prompt([{
                                            type: "list",
                                            name: "choice",
                                            message: "More or Exit",
                                            choices: ["Add More","Other", "EXIT"]
                                        }]).then(function (user2) {
                                            if (user2.choice === "EXIT") {
                                                connection.end();
                                            } else if (user2.choice === "Add More") {
                                                addInventory();
                                            } else if (user2.choice === "Other") {
                                                start();
                                            }
                                        });
                                    }
                                    });
                                }
                            }
                        );
                    }
                });
        });
};





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

//Adds an entirely new product
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
                            //Puts it in the DB
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

//Sexy '80's LOGO!!
CFonts.say('Bamazon|Manager!', {
    font: 'chrome',              // define the font face
    align: 'left',              // define text alignment
    colors: ['#0ff','#00ff00','#ff0'],         // define all colors
    background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
    letterSpacing: 1,           // define letter spacing
    lineHeight: 1,              // define the line height
    space: true,                // define if the output text should have empty lines on top and on the bottom
    maxLength: '0',             // define how many character can be on one line
});
start();

