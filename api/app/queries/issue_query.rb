# frozen_string_literal: true

class IssueQuery
  FILTERS = %w[status issue_type assignee_id epic_id].freeze

  def initialize(scope, filters = {})
    @scope = scope
    @filters = filters
  end

  def call
    scope.where(compact_filters)
  end

  private

  attr_reader :scope, :filters

  def compact_filters
    filters
      .to_h
      .stringify_keys
      .slice(*FILTERS)
      .compact_blank
  end
end
