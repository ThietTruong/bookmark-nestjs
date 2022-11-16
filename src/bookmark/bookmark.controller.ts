import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../decorator';
import { JwtGuard } from '../guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}
  @Get()
  getBookmarks(@GetUser('id') userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Patch()
  editBookmarkById(
    @GetUser('id') userId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.editBookmarkById(userId, dto);
  }

  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Body('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.deleteBookmarkById(userId, bookmarkId);
  }
}
