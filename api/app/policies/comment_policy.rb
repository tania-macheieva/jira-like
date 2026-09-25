# frozen_string_literal: true

class CommentPolicy < ApplicationPolicy
  def show?
    membership.present?
  end

  alias create? show?

  def update?
    owner? || moderator?
  end

  alias destroy? update?

  class Scope < ApplicationPolicy::Scope
    def resolve
      @scope.joins(issue: { workspace: :workspace_memberships })
            .where(workspace_memberships: { user_id: @user.id })
    end
  end

  private

  def membership
    @membership ||= record.issue.workspace.workspace_memberships.find_by(user_id: user.id)
  end

  def owner?
    record.user_id == user.id
  end

  def moderator?
    membership&.admin? || membership&.owner?
  end
end
