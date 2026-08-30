import {
useEffect,
useState,
} from "react";

import {
FiBox,
FiRefreshCw,
FiShoppingBag,
FiUsers,
} from "react-icons/fi";

import {
getAdminDashboard,
} from "../../../services/adminService";

import styles from "./Dashboard.module.css";

function getDashboardData(response) {
return (
response?.data?.overview ||
response?.overview ||
response?.data?.dashboard ||
response?.dashboard ||
response?.data ||
response ||
{}
);
}

function getNumber(object, keys) {
if (!object) {
return 0;
}

for (const key of keys) {
const value = Number(
object[key],
);

if (Number.isFinite(value)) {
  return value;
}

}

return 0;
}

function Dashboard() {
const [
dashboard,
setDashboard,
] = useState(null);

const [
loading,
setLoading,
] = useState(true);

const [
refreshing,
setRefreshing,
] = useState(false);

const [
error,
setError,
] = useState("");

const loadDashboard =
async (
isRefresh = false,
) => {
try {
if (isRefresh) {
setRefreshing(true);
} else {
setLoading(true);
}

    setError("");

    const response =
      await getAdminDashboard();

    setDashboard(
      getDashboardData(
        response,
      ),
    );
  } catch (requestError) {
    setError(
      requestError?.message ||
        "Unable to load dashboard.",
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

useEffect(() => {
let mounted = true;

const load = async () => {
  try {
    setLoading(true);
    setError("");

    const response =
      await getAdminDashboard();

    if (!mounted) {
      return;
    }

    setDashboard(
      getDashboardData(
        response,
      ),
    );
  } catch (requestError) {
    if (!mounted) {
      return;
    }

    setError(
      requestError?.message ||
        "Unable to load dashboard.",
    );
  } finally {
    if (mounted) {
      setLoading(false);
    }
  }
};

load();

return () => {
  mounted = false;
};

}, []);

const totalUsers =
getNumber(
dashboard,
[
"totalUsers",
"userCount",
],
);

const totalProducts =
getNumber(
dashboard,
[
"totalProducts",
"productCount",
],
);

const totalOrders =
getNumber(
dashboard,
[
"totalOrders",
"orderCount",
],
);

const cards = [
{
label: "Total Users",
value: totalUsers,
icon: FiUsers,
},
{
label: "Total Products",
value: totalProducts,
icon: FiBox,
},
{
label: "Total Orders",
value: totalOrders,
icon: FiShoppingBag,
},
];

if (loading) {
return (
<section
className={
styles.page
}
>
<div
className={
styles.state
}
>
Loading dashboard...
</div>
</section>
);
}

if (error) {
return (
<section
className={
styles.page
}
>
<div
className={
styles.error
}
>
<strong>
Unable to load dashboard
</strong>

      <p>{error}</p>

      <button
        type="button"
        onClick={() =>
          loadDashboard()
        }
      >
        Try Again
      </button>
    </div>
  </section>
);

}

return (
<section
className={
styles.page
}
>
<div
className={
styles.header
}
>
<div>
<span
className={
styles.eyebrow
}
>
Overview
</span>

      <h1
        className={
          styles.title
        }
      >
        Dashboard
      </h1>

      <p
        className={
          styles.subtitle
        }
      >
        Manage your jewellery
        store from one place.
      </p>
    </div>

    <button
      type="button"
      className={
        styles.refreshButton
      }
      onClick={() =>
        loadDashboard(true)
      }
      disabled={
        refreshing
      }
    >
      <FiRefreshCw
        size={15}
      />

      {refreshing
        ? "Refreshing..."
        : "Refresh"}
    </button>
  </div>

  <div
    className={
      styles.cards
    }
  >
    {cards.map(
      ({
        label,
        value,
        icon: Icon,
      }) => (
        <div
          key={label}
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardIcon
            }
          >
            <Icon
              size={20}
            />
          </div>

          <div
            className={
              styles.cardContent
            }
          >
            <span>
              {label}
            </span>

            <strong>
              {value.toLocaleString(
                "en-IN",
              )}
            </strong>
          </div>
        </div>
      ),
    )}
  </div>

  <div
    className={
      styles.welcome
    }
  >
    <span
      className={
        styles.welcomeLabel
      }
    >
      Administration
    </span>

    <h2>
      Store management
    </h2>

    <p>
      Use the navigation to
      manage products,
      categories, orders,
      users, reviews,
      coupons and offers.
      All admin sections are
      connected to the
      protected backend API.
    </p>
  </div>
</section>

);
}

export default Dashboard;