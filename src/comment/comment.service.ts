import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from 'src/post/post.model';
import { User, UserDocument } from 'src/user/user.model';
import { Comment, CommentDocument } from './comment.model';

@Injectable()
export class CommentService {
    constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
 @InjectModel(Comment.name) private readonly commentModel: Model<Comment>) {}

    async getAllComments() {
        return await this.commentModel.find();
    }

    async getCommentsByPostId(id: string) {
        const post = await this.postModel.findOne({_id: id});
        if (!post) throw new NotFoundException('Post not found');
        const comments = await this.commentModel.find({ which_post: id });
        
        return comments;
    }

    async getCommentById(id: string) {
        const comment = await this.commentModel.findById(id);
        if (!comment) throw new NotFoundException('Comment not found');
        return comment;
    }


    async createComment(dto: CommentDocument, userId: string, postId: string) {
        const post = await this.postModel.findOne({_id: postId});
        if (!post) throw new NotFoundException('Post not found');
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        if (!dto.message) throw new BadRequestException('Message is required');
        
        const comment = await this.commentModel.create({
            owner: userId,
            which_post: postId,
            message: dto.message,
        });
        return comment;
    }

    async deleteComment(id: string, user: UserDocument) {
        const comment = await this.commentModel.findById(id);
        if (!comment) throw new NotFoundException('Comment not found');
        if (comment.owner != String(user._id) as any) throw new NotFoundException('Comment owner not found');
        return await this.commentModel.findByIdAndDelete(id);
    }
}
