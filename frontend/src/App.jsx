import React, { useState } from "react"
import Landing from "./Landing"
import AppCRM from "./AppCRM"

function App() {
  const [showCRM, setShowCRM] = useState(false)

  if (!showCRM) {
    return <Landing onStart={() => setShowCRM(true)} />
  }

  return <AppCRM />
}

export default App