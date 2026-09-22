# frozen_string_literal: true

class WorkspacePolicy < ApplicationPolicy
  def show?
    membership.present?
  end

  def update?
    membership&.owner? || membership&.admin?
  end

  def destroy?
    membership&.owner?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      @scope.joins(:workspace_memberships).where(workspace_memberships: { user_id: @user.id })
    end
  end

  private

  def membership
    @membership ||= record.workspace_memberships.find_by(user_id: user.id)
  end
end
