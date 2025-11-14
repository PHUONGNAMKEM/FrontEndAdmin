import { Outlet } from "react-router-dom"
import { useContext, useEffect } from "react"
import { Spin } from "antd"
import { AuthContext } from "./components/context/auth.context"
import Header from "./components/layout/header"
import Footer from "./components/layout/footer"

const App = () => {
  const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext);

  // useEffect(() => {
  //   fetchUserInfo();
  // }, [])

  // const fetchUserInfo = async () => {
  //   const res = await getAccountAPI();
  //   if (res.data) {
  //     setUser(res.data.user)
  //   }
  //   setIsAppLoading(false);
  // }

  return (
    <>
      {isAppLoading === true ?
        <div
          style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <Spin />
        </div>
        : <>
          <Header />
          <Outlet />
          {/* <Footer /> */}
        </>}
    </>
  )
}

export default App
