import HeroSection from "../../components/home/HeroSection/HeroSection";
import CategorySection from "../../components/home/CategorySection/CategorySection";
import FeaturedProducts from "../../components/home/FeaturedProducts/FeaturedProducts";
import NewArrivals from "../../components/home/NewArrivals/NewArrivals";
import BestSellers from "../../components/home/BestSellers/BestSellers";
import OfferSection from "../../components/home/OfferSection/OfferSection";
import styles from "./Home.module.css";

function Home() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <NewArrivals />
      <BestSellers />
      <OfferSection />
    </div>
  );
}

export default Home;