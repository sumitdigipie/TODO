import React from 'react'

const Loader = () => {
  return (
    <div>
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] py-12">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-16 w-16 border-t-blue-600 animate-spin"></div>
      </div>
    </div>
  )
}

export default Loader
