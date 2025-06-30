
import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Badge,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [cartData, setCartData] = useState([]);

  const cartItems = generateCartItemsFrom(cartData, products);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    performAPICall();
    fetchCart();
  }, []);

  const performAPICall = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (e) {
      enqueueSnackbar("Failed to fetch products. Check backend.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartData(response.data);
    } catch (e) {
      enqueueSnackbar("Could not fetch cart details", { variant: "error" });
    }
  };

  const handleAddToCart = async (productId, qty, fromProductCard = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
      return;
    }

    const existingItem = cartData.find((item) => item.productId === productId);

    if (fromProductCard && existingItem && qty === 1) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
      return;
    }

    try {
      const response = await axios.post(
        `${config.endpoint}/cart`,
        { productId, qty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCartData(response.data);
      enqueueSnackbar("Cart updated", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Error adding item to cart", { variant: "error" });
    }
  };

  const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setFilteredProducts(response.data);
    } catch (e) {
      setFilteredProducts([]);
      enqueueSnackbar("No products found or error occurred.", {
        variant: "warning",
      });
    }
  };

  const debounceSearch = (event) => {
    const text = event.target.value;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch(text);
    }, 500);

    setDebounceTimeout(timeout);
  };

  const Displayproducts = filteredProducts ? filteredProducts : products;

  return (
    <div>
      {/* Include badge in Header or wherever you show cart count */}
      <Header>
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={debounceSearch}
        />
       
      </Header>

      {/* Mobile search */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={debounceSearch}
      />

      {/* Hero Banner */}
      <Grid container>
        <Grid item className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
        </Grid>
      </Grid>

      {/* Product Cards and Cart */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Grid container spacing={2}>
            {loading ? (
              <Box className="loading">
                <CircularProgress />
                <p>Loading...</p>
              </Box>
            ) : Displayproducts.length === 0 ? (
              <Box className="loading">
                <SentimentDissatisfied />
                <p>No products found</p>
              </Box>
            ) : (
              Displayproducts.map((item) => (
                <Grid item xs={6} md={3} key={item._id}>
                  <ProductCard
                    product={item}
                    handleAddToCart={() =>
                      handleAddToCart(item._id, 1, true)
                    }
                  />
                </Grid>
              ))
            )}
          </Grid>
        </Grid>

        {localStorage.getItem("token") && (
          <Grid item xs={12} md={3}>
            <Cart
              products={products}
              items={cartItems}
              handleQuantity={(productId, newQty) => {
                handleAddToCart(productId, newQty);
              }}
            />
          </Grid>
        )}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
