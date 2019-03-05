var inquirer = require("inquirer");

var Table = require("cli-table");
const CFonts = require('cfonts');

var mysql = require("mysql");
//Seperator
var sep = "\n-----------------------------------------------\n";

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazonDB"
});

//Prints the table of Prods
function printProducts(buying) {
    var table = new Table({
        head: ['Item Id', 'Product Name', 'Price','Quantity']
      , colWidths: [10,30,10,10]
    });
    //Gets prods form DB
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
            if (buying) {
                buy();
            } else {
                start();
            }
        }
    })
};

//Updates INV
    function update(userHowMany, quantity, difference, itemID) {
    //Adds Quantity
        connection.query(`UPDATE products SET stock_quantity = ? WHERE item_id = ?;`, [difference, itemID], function (err, res) {
            if (err) {
                console.log(`Your error is: ${err}`);
            } else {
                console.log(sep + "Thank you for your purchase! Please allow 2 day for delivery for PRIMARY members." + sep)

                start();
            }
        });

    };
    
    //Buy Function
    function buy() {
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
            //selects item
            connection.query("SELECT * FROM products WHERE item_id=?", [user.itemId], function (err, res) {
                var quantity = res[0].stock_quantity;
                var difference = quantity - user.howMany;
                var userHowMany = user.howMany;
                var itemID = user.itemId;
                if (err) {
                    console.log(err);
                } else if (user.howMany <= quantity && quantity > 0) {
                    //sends to update function
                    update(userHowMany, quantity, difference, itemID);
                } else if (quantity===0){
                    //Out of stock??
                    console.log(`${sep}Sorry, this item is currently out of stock.`);
                    start();
                } else {
                    //You are trying to buy too many
                    console.log(`${sep}We currently only have ${quantity} in stock`);
                    buy();
                }

            });

        });



    };
    //What would you like to do?
    function start() {
        console.log(sep);
        inquirer.prompt([
            {
                type: "list",
                name: "buyOrNot",
                message: "What would you like to do today?",
                choices: ["Buy an item","Browse products for sale","EXIT"]
            }
        ])
            .then(function (user) {
                if (user.buyOrNot === "EXIT") {
                    console.log(sep + "Thank you for choosing Bamazon! See you next time..." + sep);
                    //Ends the program
                    connection.end();

                } else if (user.buyOrNot === "Buy an item") {
                    printProducts(true);
                } else if (user.buyOrNot === "Browse products for sale") {
                    printProducts();
                }
            });
    };
    //Makes a sexy '80's LOGO!!!!
    CFonts.say('Welcome to|Bamazon!', {
        font: 'chrome',              // define the font face
        align: 'center',              // define text alignment
        colors: ['#0ff','#00ff00','#ff0'],         // define all colors
        background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
        letterSpacing: 1,           // define letter spacing
        lineHeight: 1,              // define the line height
        space: true,                // define if the output text should have empty lines on top and on the bottom
        maxLength: '0',             // define how many character can be on one line
    });
    start();

