import { useContext } from "react"
import { AuthContext } from "../components/context/auth.context"
import { Link } from "react-router-dom";
import { Button, Result } from "antd";
import { IPrivateRouteProps } from "../interface/IPrivateRouteProps";

const PrivateRoute = (props: IPrivateRouteProps) => {
    const { user } = useContext(AuthContext);

    if (user && user.idUser) {
        return (<>
            {props.children}
        </>)
    }
    // return (<Navigate to="/login" replace />);
    return (<Result
        status="403"
        title="Unauthorize!"
        subTitle={"You'd need to log in to access these sources"}
        extra={<Button type="primary"><Link to="/">Back to homepage</Link></Button>}
    />);
}

export default PrivateRoute;