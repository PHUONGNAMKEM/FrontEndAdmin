import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './richEditor.scss'

type RichEditorProps = {
    value: string | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
};

const RichEditor2 = ({ value, onChange, placeholder }: RichEditorProps) => {
    // Tùy chọn bảng màu (có thể để null để dùng default)
    const COLORS = [
        '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00',
        '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc',
        '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff'
    ];

    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: COLORS }, { background: COLORS }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'blockquote', 'code-block'],
            ['clean'],
        ],
        history: { delay: 500, maxStack: 100, userOnly: true },
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet',
        'align',
        'link', 'blockquote', 'code-block'
    ];

    return (
        <ReactQuill
            value={value}
            onChange={(html) => onChange(html)}
            placeholder={placeholder}
            theme="snow"
            style={{ height: 200, marginBottom: 24 }}
            modules={modules}
            formats={formats}
        />
    );
};

export default RichEditor2;
