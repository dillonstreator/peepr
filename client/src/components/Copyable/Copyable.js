import React from 'react';

import copyToClipboard from '../../utils/copy-to-clipboard';

const noop = (_) => _;

const Copyable = ({ onSuccess = noop, onFail = noop, children, className = "" }) => {
    const parentRef = React.useRef();

    const copy = async () => {
        const text = parentRef.current.innerText;
        console.log('attempting copy of ', text);
        try {
            await copyToClipboard(text);
            onSuccess(text);
        } catch (error) {
            onFail(error);
        }
    };

    return (
        <div ref={parentRef} onClick={copy} className={className}>
            {children}
        </div>
    )
};

export default Copyable;