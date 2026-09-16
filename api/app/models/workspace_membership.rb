# frozen_string_literal: true

class WorkspaceMembership < ApplicationRecord
  belongs_to :user
  belongs_to :workspace

  enum :role,
       {
         owner: 0,
         admin: 1,
         member: 2
       }

  validates :role, presence: true
  validates :user_id, uniqueness: { scope: :workspace_id, message: 'is already a member of this workspace' }
end
