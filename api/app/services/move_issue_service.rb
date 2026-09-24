# frozen_string_literal: true

class MoveIssueService
  def initialize(issue:, to_status:, workflow_engine: WorkflowEngine.new)
    @issue = issue
    @to_status = to_status
    @workflow_engine = workflow_engine
  end

  def call
    @workflow_engine.transition!(@issue.status, @to_status)
    @issue.update!(status: @to_status)
    @issue
  end
end
