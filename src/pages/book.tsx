// import { Button, Table } from "antd";
import { useEffect, useState } from "react";
import { fetchBookAuthAPI } from "../services/api.service";
// import UserForm from "../components/user/user.form";
import BookTable from "../components/book/book.table";
// import BookForm from "../components/book/create.book.form.control";

const BookPage = () => {

    const [bookData, setBookData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadBook()
    }, [current, pageSize])

    const loadBook = async () => {
        const res = await fetchBookAuthAPI(current, pageSize);
        if (res.data) {
            setBookData(res.data.result);
            setCurrent(res.data.meta.current);
            setPageSize(res.data.meta.pageSize);
            setTotal(res.data.meta.total);
        }
    }

    return (
        // <div style={{ margin: "20px" }}>
        //     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" }}>
        //         <h2>Table Book</h2>
        //         <Button type="primary">Create Book</Button>
        //     </div>
        //     <Table dataSource={bookData} columns={columns} />
        // </div>
        <div style={{ padding: "20px" }}>
            {/* <BookForm loadBook={loadBook} /> */}
            <BookTable
                bookData={bookData}
                loadBook={loadBook}
                current={current}
                pageSize={pageSize}
                total={total}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
            />
        </div>
    );
}

export default BookPage;