# WorkflowEngine

`WorkflowEngine` is a framework-independent Ruby gem for validating state
transitions. It has no Rails or ActiveRecord dependency.

The Rails application uses it to validate `Issue.status` changes through
`MoveIssueService`; the gem itself only knows about statuses and transition
rules.

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

## Local development

Build the gem from this directory:

```bash
gem build workflow_engine.gemspec
```

The API references it as a local gem. From the API directory, install all
dependencies with:

```bash
bundle install
```

The repository-level `api/bin/check` script builds the gem and runs a smoke
check for both allowed and rejected transitions.
