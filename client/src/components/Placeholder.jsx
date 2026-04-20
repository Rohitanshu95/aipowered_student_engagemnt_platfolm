import React from 'react'
export default function Placeholder({ name }) {
    return (
        <div className="flex flex-col items-center justify-center h-[500px] text-gray-500">
            <div className="text-xl font-medium mb-2">{name}</div>
            <p>This module is coming in the next stage of implementation.</p>
        </div>
    )
}
