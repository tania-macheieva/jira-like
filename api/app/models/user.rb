# frozen_string_literal: true

class User < ApplicationRecord
  has_many :workspace_memberships, dependent: :destroy
  has_many :workspaces, through: :workspace_memberships

  has_many :created_issues, class_name: 'Issue', foreign_key: :creator_id, dependent: :destroy
end
