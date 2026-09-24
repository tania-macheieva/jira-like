# WorkflowEngine

`WorkflowEngine` is a framework-independent Ruby gem for validating state
transitions. It has no Rails or ActiveRecord dependency.

```ruby
require 'workflow_engine'

engine = WorkflowEngine.new
engine.allowed?(:qa, :done) # true
engine.allowed?(:review, :done) # false
engine.transition!(:qa, :done) # => :done
```

The transition map can be customized:

```ruby
engine = WorkflowEngine.new(
  transitions: {
    draft: [:published],
    published: []
  }
)
```
