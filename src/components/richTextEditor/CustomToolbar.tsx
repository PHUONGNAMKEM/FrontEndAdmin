export const CustomToolbar = () => (
    <div id="toolbar">
        <select className="ql-font" defaultValue="">
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
        </select>
        <select className="ql-size" defaultValue="normal">
            <option value="small" />
            <option value="normal" />
            <option value="large" />
            <option value="huge" />
        </select>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
        <select className="ql-color" />
        <select className="ql-background" />
        <button className="ql-blockquote" />
        <button className="ql-code-block" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <button className="ql-indent" value="-1" />
        <button className="ql-indent" value="+1" />
        <button className="ql-align" value="" />
        <button className="ql-align" value="center" />
        <button className="ql-align" value="right" />
        <button className="ql-align" value="justify" />
        <button className="ql-link" />
        <button className="ql-image" />
        <button className="ql-clean" />
    </div>
);
