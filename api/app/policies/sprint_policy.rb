# frozen_string_literal: true

class SprintPolicy < ApplicationPolicy
  def show?
    membership.present?
  end

  alias create? show?
  alias update? show?
  alias destroy? show?

  class Scope < ApplicationPolicy::Scope
    def resolve
      @scope.joins(:workspace)
            .joins(workspace: :workspace_memberships)
            .where(workspace_memberships: { user_id: @user.id })
    end
  end

  private

  def membership
    @membership ||= record.workspace.workspace_memberships.find_by(user_id: user.id)
  end
end
