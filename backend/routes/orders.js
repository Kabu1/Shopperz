const express = require('express');
const { timeout } = require('rxjs');
const router = express.Router();
const {database} = require('../config/helpers');

/* Get all orders. */
router.get('/', (req, res) => {
  database.table('orders_details as od')
  .join([
    {
      table: 'orders as o',
      on: 'o.id = od.order_id'
    },
    {
      table: 'products as p',
      on: 'p.id = od.product_id'
    },
    {
      table: 'users as u',
      on: 'u.id = o.user_id'
    }
  ])
  .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username', 'p.image', 'od.quantity as quantityOrdered'])
  .getAll()
  .then(orders => {
    if(orders.length > 0){
      res.status(200).json(orders);
    }else{
      res.json({message: 'No orders Found'});
    }
  }).catch(err =>console.log(err));

});

/*Get single order */
router.get('/:id', (req, res)=>{
  const orderId = req.params.id;
  database.table('orders_details as od')
  .join([
    {
      table: 'orders as o',
      on: 'o.id = od.order_id'
    },
    {
      table: 'products as p',
      on: 'p.id = od.product_id'
    },
    {
      table: 'users as u',
      on: 'u.id = o.user_id'
    }
  ])
  .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username'])
  .filter({'o.id': orderId})
  .getAll()
  .then(orders => {
    if(orders.length > 0){
      res.status(200).json(orders);
    }else{
      res.json({message: `No orders Found with orderId ${orderId}`});
    }
  }).catch(err => console.log(err));

})


/* place a new order*/
router.post('/new', (req, res)=> {
  //we always add a body to post
  let {userId, products} = req.body;
  if(userId !== null && userId > 0){
    database.table('orders')
    .insert({
      user_id: userId
    }).then(newOrderId =>{
        if(newOrderId > 0){
          // console.log('check new order', newOrderId);
          products.forEach(async(p)=>{
            let data = await database.table('products')
            .filter({id:p.id})
            .withFields(['quantity'])
            .get()

            let inCart = parseInt(p.inCart);
            //deducting the number of pieces ordered from the quantity column in database
            if(data.quantity > 0){
              data.quantity = data.quantity - inCart;

              if(data.quantity < 0){
                data.quantity = 0;
              }
            }else{
              data.quantity = 0;
            }
        // insert order details of the newly created order
            database.table('orders_details')
            .insert({
              order_id: newOrderId,
              product_id: p.id,
              quantity: inCart
            }).then(newId =>{
              database.table('products')
                .filter({id: p.id})
                .update({
                    quantity: data.quantity
                })
                .then(successNum =>{
                    //
                }).catch(err => console.log(err));
            }).catch(err, console.log(err));
          });
        } else{
          // res.json({message: 'new order failed while adding the order details', success: false})
        }
        // res.json({
        //   message:`order successfully place with order id ${newOrderId}`,
        //   success: true,
        //         order_id: newOrderId,
        //         products: products
        // })

    }).catch(err, res.json(err));
  }else {
    res.json({
      message: 'New order failed', success:false
    });
  }


 });

 /*fake payment fateway*/
router.post('/payment', (req, res)=>{
  setTimeout(()=>{
    res.status(200).json({success: true});
  },3000)
})
module.exports = router;
