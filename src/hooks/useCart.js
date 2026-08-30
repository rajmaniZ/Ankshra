import { useCartContext } from "../context/CartContext";

function useCart() {
  return useCartContext();
}

export default useCart;