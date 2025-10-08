import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { Editor } from 'primereact/editor';
import './richEditor.scss'

type RichEditorProps = {
    value: string | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
};

const RichEditor = ({ value, onChange, placeholder }: RichEditorProps) => {
    return (
        <ReactQuill
            value={value}
            onChange={(html) => onChange(html)}
            placeholder={placeholder}
            theme="snow"
            style={{ height: 200, marginBottom: "24px" }}
        />
    )
}
export default RichEditor;
