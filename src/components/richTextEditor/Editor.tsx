// src/components/RichTextEditor.tsx
import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './editor.scss'

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

const Editor: React.FC<Props> = ({ value, onChange, placeholder }) => {
    const quillRef = useRef<ReactQuill>(null);

    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        const container = editor?.root;

        if (container) {
            container.style.minHeight = '80px';
            container.style.maxHeight = '200px';
            container.style.overflowY = 'auto';
        }
    }, []);

    return (
        <ReactQuill
            className='ql-editor'
            ref={quillRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            modules={modules}
        />
    );
};

const modules = {
    toolbar: [
        [{ 'font': [] }, { 'size': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }, { 'align': [] }],
        ['link', 'image'],
    ],
};

export default Editor;
