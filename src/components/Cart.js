// Cart.js
import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

export const generateCartItemsFrom = (cartData, productsData) => {
  if (!cartData || !productsData) return [];

  const cartMap = new Map();

  cartData.forEach(({ productId, qty }) => {
    if (cartMap.has(productId)) {
      cartMap.set(productId, cartMap.get(productId) + qty);
    } else {
      cartMap.set(productId, qty);
    }
  });

  const result = [];

  for (const [productId, totalQty] of cartMap.entries()) {
    const product = productsData.find((p) => p._id === productId);
    if (product) {
      result.push({
        productId,
        qty: totalQty,
        name: product.name,
        category: product.category,
        cost: product.cost,
        rating: product.rating,
        image: product.image,
      });
    }
  }
  // test

  return result;
};

export const getTotalCartValue = (items = []) =>
  items.reduce((total, item) => total + item.cost * item.qty, 0);

const ItemQuantity = ({ value, handleAdd, handleDelete }) => (
  <Stack direction="row" alignItems="center">
    <IconButton
      data-testid="RemoveOutlinedIcon"
      size="small"
      color="primary"
      onClick={handleDelete}
    >
      <RemoveOutlined />
    </IconButton>
    <Box padding="0.5rem" data-testid="item-qty">
      {value}
    </Box>
    <IconButton
      data-testid="AddOutlinedIcon"
      size="small"
      color="primary"
      onClick={handleAdd}
    >
      <AddOutlined />
    </IconButton>
  </Stack>
);

const Cart = ({
  products = [],
  items = [],
  handleQuantity,
  isReadOnly = false,
}) => {
  const navigate = useHistory();

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <Box className="cart">
      {items.map((item) => (
        <Box
          key={item.productId}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding="1rem"
          className="cart-item"
        >
          <Box display="flex" alignItems="center">
            <img
              src={item.image}
              alt={item.name}
              style={{ width: "50px", marginRight: "1rem" }}
            />
            <Box>{item.name}</Box>
          </Box>

          {isReadOnly ? (
            <Box padding="0.5rem" data-testid={`item-qty`}>
              Qty: {item.qty}
            </Box>
          ) : (
            <ItemQuantity
              value={item.qty}
              handleAdd={() => handleQuantity(item.productId, item.qty + 1)}
              handleDelete={() => handleQuantity(item.productId, item.qty - 1)}
            />
          )}

          <Box textAlign="right">
            {item.qty > 1 || !isReadOnly ? (
              <>
                <div data-testid={`unit-price-${item.productId}`}>
                  ${item.cost}
                </div>
                <div data-testid={`total-price-${item.productId}`}>
                  ${item.cost * item.qty}
                </div>
              </>
            ) : (
              <div data-testid={`total-price-${item.productId}`}>
                ${item.cost * item.qty}
              </div>
            )}
          </Box>
        </Box>
      ))}

      <Box
        padding="1rem"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box color="#3C3C3C">Order total</Box>
        <Box fontWeight="700" fontSize="1.5rem" data-testid="cart-total">
          ${getTotalCartValue(items)}
        </Box>
      </Box>

      {!isReadOnly && (
        <Box display="flex" justifyContent="flex-end" className="cart-footer">
          <Button
            className="checkout-btn"
            color="primary"
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => navigate.push("/checkout")}
          >
            Checkout
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Cart;
