import React from 'react'
import Button from './Button'

const ButtonTest = () => {
  return (
    
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem' }}>
        <Button variant="primaryBorder" size="small" onClick={() => console.log('Primary Border Small clicked')}>
          Primary Border Small
        </Button>
        <Button variant="primaryBorder" size="large" onClick={() => console.log('Primary Border Large clicked')}>
          Primary Border Large
        </Button>
        <Button variant="secondaryBorder" size="small" onClick={() => console.log('Secondary Border Small clicked')}>
          Secondary Border Small
        </Button>
        <Button variant="secondaryBorder" size="large" onClick={() => console.log('Secondary Border Large clicked')}>
          Secondary Border Large
        </Button>
        <Button variant="primary" size="medium" onClick={() => console.log('Primary Medium clicked')}>
          Primary Medium
        </Button>
        <Button variant="secondary" size="medium" onClick={() => console.log('Secondary Medium clicked')}>
          Secondary Medium
        </Button>
        <Button variant="blank" size="medium" onClick={() => console.log('Blank Medium clicked')}>
          Blank Medium
        </Button>  
        <Button variant="blank" size="small">Log In</Button>  
    </div>
  )
}

export default ButtonTest