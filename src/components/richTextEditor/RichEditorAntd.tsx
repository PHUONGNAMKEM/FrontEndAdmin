import { useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ColorPicker, Button, Tooltip } from 'antd';
import { BgColorsOutlined, FontColorsOutlined, ClearOutlined } from '@ant-design/icons';

type RichEditorProps = {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
};

const presetColors = [
  '#000000', '#1f1f1f', '#595959', '#8c8c8c', '#bfbfbf', '#d9d9d9', '#ffffff',
  '#fa541c', '#fa8c16', '#fadb14', '#52c41a', '#13c2c2', '#1677ff', '#722ed1',
  '#ff4d4f', '#ff85c0', '#ffa940', '#bae637', '#5cdbd3', '#69c0ff', '#b37feb'
];

export default function RichEditorAntd({ value, onChange, placeholder }: RichEditorProps) {
  const quillRef = useRef<ReactQuill | null>(null);

  const modules = useMemo(
    () => ({
      toolbar: { container: '#toolbar-antd' },
      history: { delay: 500, maxStack: 100, userOnly: true },
    }),
    []
  );

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'blockquote', 'code-block'
  ];

  const applyFormat = (format: 'color' | 'background', value: string | false) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    quill.format(format, value);
  };

  return (
    <div className="rich-editor">
      {/* Custom toolbar: dùng class ql-toolbar để ăn style sẵn của Quill */}
      <div id="toolbar-antd" className="ql-toolbar ql-snow" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select className="ql-header" defaultValue="">
          <option value="1"></option>
          <option value="2"></option>
          <option value=""></option>
        </select>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />

        {/* Antd ColorPicker: Text color */}
        <Tooltip title="Text color">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FontColorsOutlined />
            <ColorPicker
              allowClear
              presets={[{ label: 'Preset', colors: presetColors }]}
              onChange={(_, hex) => applyFormat('color', hex || false)}
            />
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={() => applyFormat('color', false)}
            />
          </div>
        </Tooltip>

        {/* Antd ColorPicker: Background color (highlight) */}
        <Tooltip title="Highlight">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <BgColorsOutlined />
            <ColorPicker
              allowClear
              presets={[{ label: 'Preset', colors: presetColors }]}
              onChange={(_, hex) => applyFormat('background', hex || false)}
            />
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={() => applyFormat('background', false)}
            />
          </div>
        </Tooltip>

        <select className="ql-align" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <button className="ql-link" />
        <button className="ql-blockquote" />
        <button className="ql-code-block" />
        <button className="ql-clean" />
      </div>

      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={(html) => onChange(html)}
        placeholder={placeholder}
        theme="snow"
        style={{ height: 220, marginBottom: 24 }}
        modules={modules}
        formats={formats}
      />
    </div>
  );
}
