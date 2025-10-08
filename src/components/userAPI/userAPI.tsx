// import UserForm from "../components/user/user.form";
import { fetchUserAPI } from 'src/services/api.me.service';
import { useEffect, useState } from 'react';
import UserTable from '@components/user/user.table';
import UserForm from '@components/user/user.form';

const UserPage = () => {

    const [userData, setUserData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadUser();
    }, [current, pageSize]);

    const loadUser = async () => {
        const res = await fetchUserAPI(current, pageSize);
        if (res.data) {
            setUserData(res.data.result);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        }
    }

    return (
        <>
            <div style={{ padding: "20px" }}>
                <UserForm loadUser={loadUser} />
                <UserTable
                    userData={userData}
                    loadUser={loadUser}
                    current={current}
                    pageSize={pageSize}
                    total={total}
                    setCurrent={setCurrent}
                    setPageSize={setPageSize}
                />
            </div>
        </>
    );
}

export default UserPage;