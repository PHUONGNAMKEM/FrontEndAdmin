// import { Outlet } from "react-router-dom"
// import { useContext, useEffect } from "react"
// import { Spin } from "antd"
// import { AuthContext } from "./components/context/auth.context"
// import Header from "./components/layout/header"
// import Footer from "./components/layout/footer"
// import { useIsMobile } from "./hooks/useIsMobile"
// import DesktopApp from "./types/layout/DesktopApp"
// import MobileApp from "./types/layout/MobileApp"

// const App = () => {
//   const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext);

//   // useEffect(() => {
//   //   fetchUserInfo();
//   // }, [])

//   // const fetchUserInfo = async () => {
//   //   const res = await getAccountAPI();
//   //   if (res.data) {
//   //     setUser(res.data.user)
//   //   }
//   //   setIsAppLoading(false);
//   // }

//   return (
//     <>
//       {isAppLoading === true ?
//         <div
//           style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
//           <Spin />
//         </div>
//         : <>
//           <Header />
//           <Outlet />
//           {/* <Footer /> */}
//         </>}
//     </>
//   )
//   // const isMobile = useIsMobile(992); // < 992px => Tablet trở xuống

//   // if (isMobile) {
//   //   return <MobileApp />;
//   // }

//   // return <DesktopApp />;
// }

// export default App


import { useContext } from "react";
import { Spin } from "antd";
import { AuthContext } from "./components/context/auth.context";
import { useIsMobile } from "./hooks/useIsMobile";
import DesktopApp from "./types/layout/DesktopApp";
import MobileApp from "./types/layout/MobileApp";

const App = () => {
  const { isAppLoading } = useContext(AuthContext);

  // detect mobile before any return (đây là hook → không được đặt sau return)
  const isMobile = useIsMobile(992);

  // Khi đang loading → chỉ hiển thị Spin
  if (isAppLoading === true) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Spin />
      </div>
    );
  }

  // Nếu mobile → render layout Mobile
  if (isMobile) {
    return <MobileApp />;
  }

  // Nếu desktop → render layout Desktop
  return <DesktopApp />;
};

export default App;
