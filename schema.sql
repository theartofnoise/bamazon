USE bamazonDB;

CREATE TABLE IF NOT EXISTS `bamazonDB`.`products` (
  `item_id` INT NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(100) NOT NULL,
  `department_name` VARCHAR(100) NOT NULL,
  `price` DECIMAL NOT NULL,
  `stock_quantity` INT NOT NULL,
  PRIMARY KEY (`item_id`))
ENGINE = InnoDB

