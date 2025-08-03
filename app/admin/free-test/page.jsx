'use client'

import { useState } from 'react'

export default function FreeTestAdmin() {
  const [tests, setTests] = useState([])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Free Tests Management
        </h2>
        <p className="text-gray-600 mb-6">
          Create and manage free tests for users to practice with.
        </p>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Free Tests</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create New Test
          </button>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No free tests yet
            </h3>
            <p className="text-gray-600">
              Create your first free test to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{test.title}</h4>
                <p className="text-sm text-gray-600">{test.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
