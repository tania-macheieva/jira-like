class WorkspaceMembership < ApplicationRecord
  belongs_to :user_id
  belongs_to :workspace_id
end
