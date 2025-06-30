import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
  Box,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia
        component="img"
        height="200"
        image={product?.image}
        alt={product?.name}
      />
      <CardContent>
        <Typography gutterBottom variant="subtitle1" component="div">
          {product.name}
        </Typography>
        <Typography variant="h6" color="text.primary">
          ${product.cost}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 1 }}>
          <Rating value={product.rating} precision={0.5} readOnly />
        </Box>
        <Button
          className="card-button"
          variant="contained"
          color="success"
          fullWidth
          onClick={handleAddToCart}
        >
          ADD TO CART
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
