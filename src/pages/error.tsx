import { Result, Button } from "antd";
import { Link, useRouteError } from "react-router-dom";
import { RouteError } from "../types/error/RouteError";

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    let errorMessage = "An unexpected error occurred";

    if (typeof error === 'object' && error !== null) {
        const err = error as RouteError;
        errorMessage = err.statusText || err.message || errorMessage;
    }

    return (
        <Result
            status="404"
            title="Oops!"
            subTitle={errorMessage}
            extra={<Button type="primary"><Link to="/">Back to homepage</Link></Button>}
        />
    );
}
