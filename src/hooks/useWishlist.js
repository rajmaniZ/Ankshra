import {
  useWishlistContext,
} from "../context/WishlistContext";

function useWishlist() {
  return useWishlistContext();
}

export default useWishlist;