import React from 'react'
import Button from '../ui/Button'

const ButtonTest = () => {
  return (
    
        // <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem' }}>
        <div className="space-x-1.5 space-y-1.5">
        <Button variant="primaryBorder" size="sm" onClick={() => console.log('Primary Border Small clicked')}>
          Primary Border Small
        </Button>
        <Button variant="primaryBorder" size="lg" onClick={() => console.log('Primary Border Large clicked')}>
          Primary Border Large
        </Button>
        <Button variant="secondaryBorder" size="sm" onClick={() => console.log('Secondary Border Small clicked')}>
          Secondary Border Small
        </Button>
        <Button variant="secondaryBorder" size="lg" onClick={() => console.log('Secondary Border Large clicked')}>
          Secondary Border Large
        </Button>
        <Button variant="primary" size="md" onClick={() => console.log('Primary Medium clicked')}>
          Primary Medium
        </Button>
        <Button variant="secondary" size="md" onClick={() => console.log('Secondary Medium clicked')}>
          Secondary Medium
        </Button>
        <Button variant="blank" size="md" onClick={() => console.log('Blank Medium clicked')}>
          Blank Medium
        </Button>  
        <Button variant="blank" size="sm">Log In</Button>  
        <Button variant="secondary" size="xs">
  Place Bid
</Button>
    </div>
  )
}

export default ButtonTest