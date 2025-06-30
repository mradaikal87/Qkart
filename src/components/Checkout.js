// Checkout.js
import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column" mt={2}>
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        value={newAddress.value}
        onChange={(e) =>
          handleNewAddress({ ...newAddress, value: e.target.value })
        }
      />
      <Stack direction="row" spacing={2} my={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => addAddress(token, newAddress)}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() =>
            handleNewAddress({ isAddingNewAddress: false, value: "" })
          }
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });
  const [cartItems, setCartItems] = useState([]);

  const onLoadHandler = async () => {
    try {
      const productsRes = await axios.get(`${config.endpoint}/products`);
      const cartRes = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cartDetails = generateCartItemsFrom(cartRes.data, productsRes.data);
      setCartItems(cartDetails);
      setProducts(productsRes.data);
    } catch (e) {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
    }
  };

  const getAddresses = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses({ all: response.data, selected: "" });
    } catch {
      enqueueSnackbar("Could not fetch addresses.", { variant: "error" });
    }
  };

  const addAddress = async (token, newAddress) => {
    try {
      const res = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddress.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses({ all: res.data, selected: "" });
      setNewAddress({ isAddingNewAddress: false, value: "" });
    } catch (e) {
      enqueueSnackbar("Could not add this address.", { variant: "error" });
    }
  };

  const deleteAddress = async (token, addressId) => {
    try {
      const res = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses({ all: res.data, selected: "" });
    } catch (e) {
      enqueueSnackbar("Could not delete this address.", { variant: "error" });
    }
  };

  const validateRequest = (cartItems, addresses) => {
    const total = getTotalCartValue(cartItems);
    const balance = parseInt(localStorage.getItem("balance"));

    if (total > balance) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    }
    if (addresses.all.length === 0) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      return false;
    }
    if (!addresses.selected) {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  const performCheckout = async (token, cartItems, addresses) => {
    if (!validateRequest(cartItems, addresses)) return;
    try {
      const res = await axios.post(
        `${config.endpoint}/cart/checkout`,
        { addressId: addresses.selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const newBalance =
          parseInt(localStorage.getItem("balance")) -
          getTotalCartValue(cartItems);
        localStorage.setItem("balance", newBalance);
        history.push("/thanks");
      }
    } catch (e) {
      enqueueSnackbar("Checkout failed.", { variant: "error" });
    }
  };

  useEffect(() => {
    onLoadHandler();
    getAddresses(token);
  }, []);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography variant="h4" my={2}>
              Shipping
            </Typography>
            <Typography my={2}>
              Manage all the shipping addresses you want...
            </Typography>
            <Divider />

            {addresses.all.length === 0 ? (
              <Typography my={2}>
                No addresses found for this account. Please add one to proceed
              </Typography>
            ) : (
              <Box>
                {addresses.all.map((addr) => (
                  <Box
                    key={addr._id}
                    className={`address-item ${
                      addresses.selected === addr._id
                        ? "selected"
                        : "not-selected"
                    }`}
                    onClick={() =>
                      setAddresses({ ...addresses, selected: addr._id })
                    }
                  >
                    <Typography>{addr.address}</Typography>
                    <Button
                      variant="text"
                      color="error"
                      startIcon={<Delete />}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(token, addr._id);
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                ))}
              </Box>
            )}

            {!newAddress.isAddingNewAddress ? (
              <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() =>
                  setNewAddress({ isAddingNewAddress: true, value: "" })
                }
              >
                Add new address
              </Button>
            ) : (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            )}

            <Typography variant="h4" my={2}>
              Payment
            </Typography>
            <Typography my={2}>Payment Method</Typography>
            <Divider />

            <Box my={2}>
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(cartItems)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={() => performCheckout(token, cartItems, addresses)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart products={products} items={cartItems} isReadOnly={true} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;




// import { CreditCard, Delete } from "@mui/icons-material";
// import {
//   Button,
//   Divider,
//   Grid,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { Box } from "@mui/system";
// import axios from "axios";
// import { useSnackbar } from "notistack";
// import React, { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom";
// import { config } from "../App";
// import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
// import "./Checkout.css";
// import Footer from "./Footer";
// import Header from "./Header";

// const AddNewAddressView = ({
//   token,
//   newAddress,
//   handleNewAddress,
//   addAddress,
// }) => {
//   return (
//     <Box display="flex" flexDirection="column" mt={2}>
//       <TextField
//         multiline
//         minRows={4}
//         placeholder="Enter your complete address"
//         value={newAddress.value}
//         onChange={(e) =>
//           handleNewAddress({ ...newAddress, value: e.target.value })
//         }
//       />
//       <Stack direction="row" spacing={2} my={2}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => addAddress(token, newAddress)}
//         >
//           Add
//         </Button>
//         <Button
//           variant="text"
//           onClick={() =>
//             handleNewAddress({ isAddingNewAddress: false, value: "" })
//           }
//         >
//           Cancel
//         </Button>
//       </Stack>
//     </Box>
//   );
// };

// const Checkout = () => {
//   const token = localStorage.getItem("token");
//   const history = useHistory();
//   const { enqueueSnackbar } = useSnackbar();
//   const [products, setProducts] = useState([]);
//   const [addresses, setAddresses] = useState({ all: [], selected: "" });
//   const [newAddress, setNewAddress] = useState({
//     isAddingNewAddress: false,
//     value: "",
//   });
//   const [cartItems, setCartItems] = useState([]);

//   const onLoadHandler = async () => {
//     try {
//      const productsRes = await axios.get(`${config.endpoint}/products`);
//      const cartRes = await axios.get(`${config.endpoint}/cart`, {
//       headers: {
//        Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//      });
   
//      const cartDetails = generateCartItemsFrom(cartRes.data, productsRes.data);
//      setCartItems(cartDetails);
//      setProducts(productsRes.data); // Make sure to set products data.
//     } catch (e) {
//      enqueueSnackbar("Something went wrong.", { variant: "error" });
//     }
//    };
//   const getAddresses = async (token) => {
//     if (!token) return;
//     try {
//       const response = await axios.get(`${config.endpoint}/user/addresses`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAddresses({ all: response.data, selected: "" });
//       return response.data;
//     } catch {
//       enqueueSnackbar("Could not fetch addresses.", { variant: "error" });
//       return null;
//     }
//   };

//   const addAddress = async (token, newAddress) => {
//     try {
//       const res = await axios.post(
//         `${config.endpoint}/user/addresses`,
//         { address: newAddress.value },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setAddresses({ all: res.data, selected: "" });
//       setNewAddress({ isAddingNewAddress: false, value: "" });
//       return res.data;
//     } catch (e) {
//       enqueueSnackbar("Could not add this address.", { variant: "error" });
//     }
//   };

//   const deleteAddress = async (token, addressId) => {
//     try {
//       const res = await axios.delete(
//         `${config.endpoint}/user/addresses/${addressId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setAddresses({ all: res.data, selected: "" });
//       return res.data;
//     } catch (e) {
//       enqueueSnackbar("Could not delete this address.", { variant: "error" });
//     }
//   };

//   const validateRequest = (cartItems, addresses) => {
//     const total = getTotalCartValue(cartItems);
//     const balance = parseInt(localStorage.getItem("balance"));

//     if (total > balance) {
//       enqueueSnackbar(
//         "You do not have enough balance in your wallet for this purchase",
//         { variant: "warning" }
//       );
//       return false;
//     }
//     if (addresses.all.length === 0) {
//       enqueueSnackbar("Please add a new address before proceeding.", {
//         variant: "warning",
//       });
//       return false;
//     }
//     if (!addresses.selected) {
//       enqueueSnackbar("Please select one shipping address to proceed.", {
//         variant: "warning" },
//       );
//       return false;
//     }
//     return true;
//   };

//   const performCheckout = async (token, cartItems, addresses) => {
//     if (!validateRequest(cartItems, addresses)) return;
//     try {
//       const res = await axios.post(
//         `${config.endpoint}/cart/checkout`,
//         { addressId: addresses.selected },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (res.data.success) {
//         const newBalance =
//           localStorage.getItem("balance") - getTotalCartValue(cartItems);
//         localStorage.setItem("balance", newBalance);
//         history.push("/thanks");
//         return true;
//       }
//     } catch (e) {
//       enqueueSnackbar("Checkout failed.", { variant: "error" });
//     }
//   };

//   useEffect(() => {
//     onLoadHandler();
//   }, []);

//   return (
//     <>
//       <Header />
//       <Grid container>
//         <Grid item xs={12} md={9}>
//           <Box className="shipping-container" minHeight="100vh">
//             <Typography variant="h4" my={2}>Shipping</Typography>
//             <Typography my={2}>Manage all the shipping addresses you want...</Typography>
//             <Divider />

//             {addresses.all.length === 0 ? (
//               <Typography my={2}>
//                 No addresses found for this account. Please add one to proceed
//               </Typography>
//             ) : (
//               <Box>
//                 {addresses.all.map((addr) => (
//                   <Box
//                     key={addr._id}
//                     className={`address-item ${
//                       addresses.selected === addr._id ? "selected" : "not-selected"
//                     }`}
//                     onClick={() => setAddresses({ ...addresses, selected: addr._id })}
//                   >
//                     <Typography>{addr.address}</Typography>
//                     <Button
//                       variant="text"
//                       color="error"
//                       startIcon={<Delete />}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         deleteAddress(token, addr._id);
//                       }}
//                     >
//                       Delete
//                     </Button>
//                   </Box>
//                 ))}
//               </Box>
//             )}

//             {!newAddress.isAddingNewAddress ? (
//               <Button
//                 color="primary"
//                 variant="contained"
//                 id="add-new-btn"
//                 size="large"
//                 onClick={() => setNewAddress({ isAddingNewAddress: true, value: "" })}
//               >
//                 Add new address
//               </Button>
//             ) : (
//               <AddNewAddressView
//                 token={token}
//                 newAddress={newAddress}
//                 handleNewAddress={setNewAddress}
//                 addAddress={addAddress}
//               />
//             )}

//             <Typography variant="h4" my={2}>Payment</Typography>
//             <Typography my={2}>Payment Method</Typography>
//             <Divider />

//             <Box my={2}>
//               <Typography>Wallet</Typography>
//               <Typography>
//                 Pay ${getTotalCartValue(cartItems)} of available $
//                 {localStorage.getItem("balance")}
//               </Typography>
//             </Box>

//             <Button
//               startIcon={<CreditCard />}
//               variant="contained"
//               onClick={() => performCheckout(token, cartItems, addresses)}
//             >
//               PLACE ORDER
//             </Button>
//           </Box>
//         </Grid>
//         <Grid item xs={12} md={3} bgcolor="#E9F5E1">
//           <Cart isReadOnly items={cartItems} />
//         </Grid>
//       </Grid>
//       <Footer />
//     </>
//   );
// };

// export default Checkout;
