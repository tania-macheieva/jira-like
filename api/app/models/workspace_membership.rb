# frozen_string_literal: true

class WorkspaceMembership < ApplicationRecord
  belongs_to :user
  belongs_to :workspace_id
end
