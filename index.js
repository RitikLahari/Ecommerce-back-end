const express=require('express');
const server=express();
const mongoose = require('mongoose');
const path=require('path')
const cors = require('cors')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const cookieParser=require('cookie-parser')
const { createProduct } = require('./controller/Product');
const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categorys');
const brandsRouter = require('./routes/Brands');
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const { sanitizeUser, isAuth, cookieExtractor } = require('./services/common');
const { User } = require('./model/User');
const { emit } = require('process');
// const ordersRouter = require('./routes/Order');
const SECRET_KEY = 'SECRET_KEY';
// JWT options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY;



server.use(express.static(path.resolve(__dirname,'build')))
server.use(express.json());

server.use(
  session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);
server.use(cookieParser());
server.use(passport.authenticate('session'));
server.use(
  cors({
    exposedHeaders: ['X-Total-Count'],
  })
);

server.use('/products', productsRouter.router);
server.use('/categories', categoriesRouter.router)
server.use('/brands', brandsRouter.router)
server.use('/users', usersRouter.router)
server.use('/auth', authRouter.router)
server.use('/cart', cartRouter.router)
server.use('/orders', ordersRouter.router)
 server.use(express.raw({type: 'application/json'}));
 server.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));

// passport.use(
//   'local',
//   new LocalStrategy({usernameField:'email'},async function (email, password, done) {
//     // by default passport uses username
//     try {
//       const user = await User.findOne({ email: email });
//       console.log(email, password, user);
//       if (!user) {
//         return done(null, false, { message: 'invalid credentials' }); // for safety
//       }
//       crypto.pbkdf2(
//         password,
//         user.salt,
//         310000,
//         32,
//         'sha256',
//         async function (err, hashedPassword) {
//           if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
//             return done(null, false, { message: 'invalid credentials' });
//           }
//           const token = jwt.sign(sanitizeUser(user), SECRET_KEY);
//           done(null, {token}); // this lines sends to serializer
//         }
//       );
//     } catch (err) {
//       done(err);
//     }
//   })
// );
// passport.use(
//   'jwt',
//   new JwtStrategy(opts, async function (jwt_payload, done) {
//     console.log("jwt payload",{ jwt_payload });
//     try {
//       const user = await User.findById(jwt_payload.id);
//       if (user) {
//         return done(null, sanitizeUser(user)); // this calls serializer
//       } else {
//         return done(null, false);
//       }
//     } catch (err) {
//       return done(err, false);
//     }
//   })
// );

// //this will make serialize user when user authenticate create session
// passport.serializeUser(function (user, cb) {
//   console.log('serialize', user);
//   process.nextTick(function () {
//     return cb(null, { id: user.id, role: user.role });
//   });
// });

// // this changes session variable req.user when called from authorized request

// passport.deserializeUser(function (user, cb) {
//   console.log('de-serialize', user);
//   process.nextTick(function () {
//     return cb(null,user);
//   });
// });

main().catch(err=> console.log(err));

async function main(){
    await mongoose.connect('mongodb+srv://user1:password_user1@cluster0.qwuiamz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('database connected')
}
server.get('/',(req,res)=>{
    res.json({status:'sucess'})
 
})




// Payments
// This is your test secret API key.
const stripe = require("stripe")('sk_test_51PdPR02LpWeBe1u79Nu9KHD9bnUPDr4QRDpouqImFHFrVwbPfh79t9zKjhvfjIAzn7woY6L4c1LiJXRHDjUN6CX4000U5MepkK');


server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount*100, // for decimal compensation
    currency: "inr",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// Webhook
const endpointSecret = "whsec_0e1456a83b60b01b3133d4dbe06afa98f384c2837645c364ee0d5382f6fa3ca2";
server.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      console.log({paymentIntentSucceeded})
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
})


server.listen(process.env.PORT,()=>{
    console.log('server started at port 8000')
})



// mongodb+srv://lahariritik3:IHkCmcoF5hZbctlc@cluster0.qwuiamz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0