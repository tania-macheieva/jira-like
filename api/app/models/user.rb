# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  has_many :workspace_memberships, dependent: :destroy
  has_many :workspaces, through: :workspace_memberships

  has_many :created_issues, class_name: 'Issue', foreign_key: :creator_id, dependent: :destroy
  has_many :assigned_issues, class_name: 'Issue', foreign_key: :assignee_id, dependent: :nullify

  has_many :comments, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :password, length: { minimum: 8 }, allow_nil: true
  validates :password_digest, presence: true
end
